import os

for f in ['logic.js', 'logic-ch2.js']:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace('#213A54', '#0F172A')
    content = content.replace('#CBD9E6', '#E2E8F0')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Logic colors fixed.")
