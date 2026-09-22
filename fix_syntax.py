import re

with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
counts = {
    'clientSecret': 0,
    'showDraftsModal': 0,
    'savedDrafts': 0
}

for line in lines:
    if 'const [clientSecret, setClientSecret]' in line:
        if counts['clientSecret'] == 0:
            new_lines.append(line)
            counts['clientSecret'] += 1
    elif 'const [showDraftsModal, setShowDraftsModal]' in line:
        if counts['showDraftsModal'] == 0:
            new_lines.append(line)
            counts['showDraftsModal'] += 1
    elif 'const [savedDrafts, setSavedDrafts]' in line:
        if counts['savedDrafts'] == 0:
            new_lines.append(line)
            counts['savedDrafts'] += 1
    else:
        new_lines.append(line)

with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'w') as f:
    f.writelines(new_lines)
