with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'r') as f:
    lines = f.readlines()

new_lines = []
useeffect_lines = []
in_useeffect = False

for i, line in enumerate(lines):
    # lines are 0-indexed. line 187 is index 186
    if 186 <= i <= 207:
        useeffect_lines.append(line)
        continue
    
    new_lines.append(line)
    
    if i == 277: # this corresponds to line 278 in original file, i.e. after grandTotal definition
        new_lines.extend(useeffect_lines)

with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'w') as f:
    f.writelines(new_lines)
