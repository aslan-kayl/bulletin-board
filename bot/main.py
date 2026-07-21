import asyncio
import os

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://your-domain.com")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🛍 Открыть доску объявлений",
            web_app=WebAppInfo(url=MINI_APP_URL),
        )
    ]])
    await message.answer(
        "Привет! Здесь можно купить и продать что угодно.\n\n"
        "Нажми кнопку ниже, чтобы открыть доску объявлений 👇",
        reply_markup=keyboard,
    )


@dp.message()
async def fallback(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🛍 Открыть доску объявлений",
            web_app=WebAppInfo(url=MINI_APP_URL),
        )
    ]])
    await message.answer("Используй кнопку для открытия приложения 👇", reply_markup=keyboard)


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
