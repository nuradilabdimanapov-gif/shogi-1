#!/usr/bin/env python3
"""
Single-File Standalone HTML Generator for Shogi Web.
Combines index.html, all CSS files, and js/bundle.js into a single all-in-one file.
Can be double-clicked to play in any web browser without needing a server or multiple files.
"""
import os
import re

DIR = os.path.dirname(os.path.abspath(__file__))

index_path = os.path.join(DIR, 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Read all CSS files
css_files = ['css/styles.css', 'css/board.css', 'css/pieces.css', 'css/modal.css']
combined_css = ""
for cf in css_files:
    cp = os.path.join(DIR, cf)
    with open(cp, 'r', encoding='utf-8') as f:
        combined_css += f"/* === {cf} === */\n" + f.read() + "\n\n"

# Read js/bundle.js
bundle_path = os.path.join(DIR, 'js', 'bundle.js')
with open(bundle_path, 'r', encoding='utf-8') as f:
    bundle_js = f.read()

# Replace CSS link tags with embedded style
css_pattern = r'<link rel="stylesheet" href="css/[^"]+">'
# Remove all matching link tags:
html = re.sub(css_pattern, '', html)

# Insert inline style block before </head>
style_block = f"<style>\n{combined_css}\n</style>\n</head>"
html = html.replace('</head>', style_block)

# Replace script tag with embedded bundle
script_tag = '<script src="js/bundle.js"></script>'
embedded_script = f"<script>\n{bundle_js}\n</script>"
if script_tag in html:
    html = html.replace(script_tag, embedded_script)
else:
    html = html.replace('</body>', f"{embedded_script}\n</body>")

# Output to shogi.html
out_file = os.path.join(DIR, 'shogi.html')
with open(out_file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"✅ Generated single-file standalone Shogi game at: {out_file} ({len(html)} bytes)")
