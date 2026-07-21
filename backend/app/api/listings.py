import math
import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.listing import Listing, ListingImage, ListingStatus
from app.models.user import User
from app.schemas.listing import (
    ListingOut, ListingListOut, PaginatedListings, ListingCreate, ListingUpdate
)

router = APIRouter(prefix="/listings", tags=["listings"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGES_PER_LISTING = 5


def _listing_to_list_out(listing: Listing) -> ListingListOut:
    cover = listing.images[0].path if listing.images else None
    return ListingListOut(
        id=listing.id,
        title=listing.title,
        price=float(listing.price) if listing.price else None,
        is_negotiable=listing.is_negotiable,
        status=listing.status,
        category=listing.category,
        cover=cover,
        user_id=listing.user_id,
        created_at=listing.created_at,
    )


@router.get("/", response_model=PaginatedListings)
async def list_listings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: int | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    filters = [Listing.status == ListingStatus.active]
    if category_id:
        filters.append(Listing.category_id == category_id)
    if search:
        filters.append(Listing.title.ilike(f"%{search}%"))

    count_q = select(func.count()).select_from(Listing).where(and_(*filters))
    total = (await db.execute(count_q)).scalar_one()

    q = (
        select(Listing)
        .where(and_(*filters))
        .options(selectinload(Listing.category), selectinload(Listing.images))
        .order_by(Listing.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    listings = (await db.execute(q)).scalars().all()

    return PaginatedListings(
        items=[_listing_to_list_out(l) for l in listings],
        total=total,
        page=page,
        pages=math.ceil(total / page_size) if total else 1,
    )


@router.get("/my", response_model=list[ListingListOut])
async def my_listings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = (
        select(Listing)
        .where(Listing.user_id == user.id)
        .options(selectinload(Listing.category), selectinload(Listing.images))
        .order_by(Listing.created_at.desc())
    )
    listings = (await db.execute(q)).scalars().all()
    return [_listing_to_list_out(l) for l in listings]


@router.get("/{listing_id}", response_model=ListingOut)
async def get_listing(listing_id: int, db: AsyncSession = Depends(get_db)):
    q = (
        select(Listing)
        .where(Listing.id == listing_id)
        .options(
            selectinload(Listing.category),
            selectinload(Listing.images),
            selectinload(Listing.user),
        )
    )
    listing = (await db.execute(q)).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.post("/", response_model=ListingOut, status_code=201)
async def create_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: float | None = Form(None),
    is_negotiable: bool = Form(False),
    category_id: int = Form(...),
    images: list[UploadFile] = File(default=[]),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = Listing(
        title=title.strip(),
        description=description.strip(),
        price=price,
        is_negotiable=is_negotiable,
        category_id=category_id,
        user_id=user.id,
    )
    db.add(listing)
    await db.flush()

    saved_images = []
    for i, img in enumerate(images[:MAX_IMAGES_PER_LISTING]):
        if img.content_type not in ALLOWED_IMAGE_TYPES:
            continue
        ext = img.filename.rsplit(".", 1)[-1] if img.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(settings.uploads_dir, filename)
        os.makedirs(settings.uploads_dir, exist_ok=True)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(await img.read())
        saved_images.append(ListingImage(listing_id=listing.id, path=f"/uploads/{filename}", order=i))

    db.add_all(saved_images)
    await db.commit()

    q = (
        select(Listing)
        .where(Listing.id == listing.id)
        .options(
            selectinload(Listing.category),
            selectinload(Listing.images),
            selectinload(Listing.user),
        )
    )
    return (await db.execute(q)).scalar_one()


@router.patch("/{listing_id}", response_model=ListingOut)
async def update_listing(
    listing_id: int,
    data: ListingUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = (await db.execute(select(Listing).where(Listing.id == listing_id))).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your listing")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(listing, field, value)

    await db.commit()

    q = (
        select(Listing)
        .where(Listing.id == listing_id)
        .options(selectinload(Listing.category), selectinload(Listing.images))
    )
    return (await db.execute(q)).scalar_one()


@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = (await db.execute(select(Listing).where(Listing.id == listing_id))).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not your listing")
    await db.delete(listing)
    await db.commit()
