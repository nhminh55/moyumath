import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
html_files = [f for f in html_files if 'graphify' not in f and 'callflow' not in f]

old_link = '<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'
new_link_regex = r'<link href="https://fonts\.googleapis\.com/css2\?family=Outfit[^>]+rel="stylesheet">'

for f in html_files:
    if not os.path.isfile(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # Revert the link
    content = re.sub(new_link_regex, old_link, content)
    
    # Revert Nunito back to Inter
    content = content.replace("'Nunito', sans-serif", "'Inter', sans-serif")
    content = content.replace("'Nunito',sans-serif", "'Inter',sans-serif")

    # Revert Outfit back to Lora globally, EXCEPT for .value which was Caveat
    content = content.replace("'Outfit', sans-serif", "'Lora', serif")
    content = content.replace("'Outfit',sans-serif", "'Lora',serif")
    
    # Put Caveat back where it belongs (stat-tile value, picker-score-badge, etc if any was used)
    # Actually Caveat was mostly in .stat-tile .value
    content = content.replace(
        ".stat-tile .value{\n    font-family:'Lora', serif;", 
        ".stat-tile .value{\n    font-family:'Caveat', cursive;"
    )

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

# Update style.css
with open('css/style.css', 'r', encoding='utf-8') as file:
    css_content = file.read()

css_content = css_content.replace("'Nunito', sans-serif", "'Inter', sans-serif")

with open('css/style.css', 'w', encoding='utf-8') as file:
    file.write(css_content)

print("Fonts reverted.")
