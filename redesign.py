import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html') and f != 'DONE.html' and f != 'index.html']
html_files.append('index.html') # Ensure index is included
html_files = [f for f in html_files if 'graphify' not in f and 'callflow' not in f]

for f in html_files:
    if not os.path.isfile(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # Replace old fonts with new fonts in <link>
    content = re.sub(
        r'<link href="https://fonts\.googleapis\.com/css2\?family=Lora[^>]+rel="stylesheet">',
        r'<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">',
        content
    )
    
    # Remove :root block from inline styles
    content = re.sub(r':root\s*\{[^}]+\}', '', content)
    
    # Replace Lora with Outfit
    content = content.replace("'Lora',serif", "'Outfit', sans-serif")
    content = content.replace("'Lora', serif", "'Outfit', sans-serif")
    
    # Replace Inter with Nunito
    content = content.replace("'Inter',sans-serif", "'Nunito', sans-serif")
    content = content.replace("'Inter', sans-serif", "'Nunito', sans-serif")
    
    # Replace Caveat with Outfit for math text if any
    content = content.replace("'Caveat',cursive", "'Outfit', sans-serif")
    content = content.replace("'Caveat', cursive", "'Outfit', sans-serif")

    # Update body background if hardcoded
    content = content.replace("background:#E8E2D2;", "background:var(--bg);")

    # Add style.css link if missing
    if '<link rel="stylesheet" href="css/style.css">' not in content:
        content = content.replace('<style>', '<link rel="stylesheet" href="css/style.css">\n<style>')

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

# Update style.css
css_content = """/* Shared design tokens */
:root {
  --bg: #F8FAFC;
  --paper: #FFFFFF;
  --paper-edge: #E2E8F0;
  --ink: #0F172A;
  --ink-soft: #64748B;
  --graphite: #334155;
  --pen-red: #EF4444;
  --pen-green: #10B981;
  --gold: #6366F1; /* Using Indigo 500 for main accent */
  --border: #E2E8F0;
  --rule: #E2E8F0;
  --margin-line: #FBCFE8;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05), transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05), transparent 40%);
  font-family: 'Nunito', sans-serif;
  color: var(--graphite);
  min-height: 100vh;
  padding: 32px 16px 80px;
}

.card {
  background: var(--paper);
  border: 1px solid var(--paper-edge);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
}

/* Global button overrides */
a.primary, button.primary {
  background: var(--gold) !important;
  color: #fff !important;
  border-radius: 9999px !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
  transition: all 0.2s ease !important;
}
a.primary:hover, button.primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35) !important;
}
a.primary:active, button.primary:active {
  transform: translateY(1px) !important;
}

a.secondary, button.secondary {
  background: #fff !important;
  color: var(--gold) !important;
  border: 2px solid var(--gold) !important;
  border-radius: 9999px !important;
  transition: all 0.2s ease !important;
}
a.secondary:hover, button.secondary:hover {
  background: #EEF2FF !important;
  transform: translateY(-1px) !important;
}
"""
with open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Redesign complete.")
