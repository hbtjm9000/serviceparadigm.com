#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os, sys

try:
    font_large  = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 90)
    font_medium = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 56)
    font_small  = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 24)
except:
    font_large = font_medium = font_small = ImageFont.load_default()

w, h = 1200, 630
img = Image.new('RGB', (w, h), '#191c1d')
draw = ImageDraw.Draw(img)

# Decorative circles (brand cyan + teal)
draw.ellipse([840, 20, 1180, 360], fill='#006a68')
draw.ellipse([920, 200, 1160, 440], fill='#1cdcd9')

# Red banner with brand primary
draw.rectangle([60, 160, 1140, 470], fill='#a33900')

# Text layers
draw.text((120, 195), 'PARADIGM',        fill='#ffffff', font=font_large)
draw.text((120, 300), 'IT Services',     fill='#1cdcd9', font=font_medium)
draw.text((120, 380), 'Engineering the Next Paradigm', fill='#e7e8e9', font=font_small)

out = '/home/hbtjm/lab/paradigm-website/public/assets/og-image.png'
img.save(out, 'PNG', optimize=True)
sz = os.path.getsize(out) / 1024
print(f'Created: {out}  ({sz:.1f} KB)')
