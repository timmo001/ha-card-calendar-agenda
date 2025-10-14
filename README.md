# 📅 Calendar Agenda Card

A custom Home Assistant card for displaying calendar events in an agenda view.

> [!WARNING]
> This card is experimental and under active development. Features may change and breaking changes may occur.

## Features

- Display calendar events in agenda format
- Clean and modern interface
- Customizable appearance

## Installation

### HACS (Recommended)

Since this card is not yet in the default HACS store, you need to add it as a custom repository:

1. Open HACS in your Home Assistant instance
2. Click the **3 dots** in the top right corner
3. Select **"Custom repositories"**
4. Add repository URL: `https://github.com/timmo001/ha-card-calendar-agenda`
5. Select category: **Dashboard**
6. Click **"ADD"**
7. Find "Calendar Agenda Card" in the list and click **Download**

### Manual

1. Download `calendar-agenda-card.js` from the latest release
2. Place it in your `config/www` folder
3. Add the resource in your Lovelace dashboard

## Usage

Add the card to your dashboard using the Lovelace UI editor or YAML:

```yaml
type: custom:calendar-agenda-card
```
