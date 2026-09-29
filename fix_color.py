import os

files = [f for f in os.listdir('.') if f.endswith('.html') or f.endswith('.js')]
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace the specific hardcoded colors with variables
    content = content.replace('#C9C1AC', 'var(--border)')
    content = content.replace('#8A6A1F', 'var(--gold)')
    content = content.replace('#F3EFE2', 'var(--paper-edge)')
    content = content.replace('#EAE4D4', 'var(--border)')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Colors fixed.")
