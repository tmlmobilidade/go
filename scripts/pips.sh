#!/bin/bash
# start-kiosk.sh — Launch Chrome in kiosk mode on boot

URL="https://carrismetropolitana.pt/pips?stop_ids=100013&max_lines=20"

# Wait a bit for network & display manager
sleep 10

# Hide mouse cursor after a short idle time
unclutter -idle 5 &

# Start Chrome in kiosk mode
/usr/bin/google-chrome \
  --noerrdialogs \
  --disable-infobars \
  --kiosk "$URL" \
  --incognito \
  --start-fullscreen \
  --disable-translate \
  --no-first-run \
  --fast --fast-start \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --window-position=0,0 \
  --window-size=$(xdpyinfo | awk '/dimensions/{print $2}') &