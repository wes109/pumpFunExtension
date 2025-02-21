# Pump.fun Image Attacher

A Chrome extension that streamlines image transfers between Discord and Pump.fun by allowing quick image attachment with a single click.

![Example](https://github.com/user-attachments/assets/451b170b-4741-4349-907f-a73524a3163a)


## Features

- One-click image transfer from Discord to Pump.fun
- Automatic input field restrictions on Pump.fun
- Configurable default amount setting
- Real-time image detection from Discord messages
- Seamless attachment to Pump.fun's create form

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

### Basic Setup

1. Open Discord in a Chrome tab and navigate to the desired channel
2. Open `pump.fun/create` in another Chrome tab
3. A "GRAB DISCORD IMAGE" button will appear at the bottom of the Pump.fun page
4. When you see an image in Discord you want to use, click the button
5. The image will automatically attach to the Pump.fun create form

### Configuration

Click the extension icon in your Chrome toolbar to access settings:

- **Default Amount**: Set the default token amount that auto-fills on Pump.fun (default: 5)

### Input Restrictions

The extension automatically applies these restrictions on Pump.fun:
- Token Name: Maximum 32 characters
- Ticker: Maximum 10 characters
- Amount: Auto-fills with configured default value

## How It Works

The extension operates by:
1. Monitoring Discord messages for embedded images
2. When the "GRAB DISCORD IMAGE" button is clicked:
   - Captures the most recent image URL from Discord
   - Fetches the image data
   - Automatically attaches it to the file input on Pump.fun

## Technical Details

- Uses Chrome's Message Passing API for cross-tab communication
- Implements MutationObserver for real-time Discord message monitoring
- Handles various image embedding formats in Discord
- Maintains connection state between tabs
- Includes error handling and automatic reconnection

## Permissions

The extension requires these permissions:
- `tabs`: For cross-tab communication
- `storage`: For saving configuration
- `clipboardRead/Write`: For handling image data
- Access to Discord and Pump.fun domains

## Development

### Project Structure 
