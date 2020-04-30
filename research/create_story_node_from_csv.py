#run pip install -r requirements.txt
import math
import numpy as np

can_copy = True
try:
    import pyperclip
except ImportError as e:
    print("pyperclip not found!")
    can_copy = False
    pass

import pandas as pd

csv_file_name = 'choices.csv' #put file name here
columns = ['ID','Text','Option 1 (w/ ID)','Option 2 (w/ ID)','Option 3 (w/ ID)','Option 4 (w/ ID)']

df = pd.read_csv(csv_file_name)
df = df[columns]

df = df.dropna(axis=0, how='all')
df = df[df['ID'].notna()]
df['ID'] = df['ID'].astype(int)
# print(df)
# print(df.isna().sum())
df = df.replace(np.nan, '', regex=True)
print(df)
all_nodes = ''
for index, row in df.iterrows():
    info = dict()
    info['id'] = 'id: ' + (str(row['ID']) if row['ID'] else '')
    # print(row['Text'] if not math.isnan(row['Text']) else 'fdsjaofashlf')
    info['voice_text'] = 'text: ' + '"' + (str(row['Text']) if row['Text'] else '') + '"'
    num_options = 4 - (row[['Option 1 (w/ ID)','Option 2 (w/ ID)','Option 3 (w/ ID)','Option 4 (w/ ID)']].values == '').sum()
    options = [0] * int(num_options)
    info['options_text'] = 'options: ['

    for i in range (num_options):
        options[i] = dict()
        curr_option = 'Option ' + str(i+1) + ' (w/ ID)'
        option_info = row[curr_option].split('(')
        option_text = option_info[0]
        next_text = '' if len(option_info) <= 1 else option_info[1].split(')')[0]
        # options[i]['time_wait'] = 'timeWait: ' + input('time_wait: ')
        # options[i]['display_text'] = 'text: ' + '"' + input('display_text: ') + '"'
        # options[i]['next_text_id'] = 'nextText: ' + input('next_text_id: ')
        options[i]['audio_file'] = ''
        options[i]['sound_effect_file'] = ''
        options[i]['time_wait'] = ''
        options[i]['display_text'] = 'text: ' + '"' + option_text + '"'
        options[i]['next_text_id'] = 'nextText: ' + next_text

    for option in options:
        for key in option.keys():
            if len(option[key].split(':')) == 1 or len(option[key].split(':')[1]) == 1 or option[key].split(':')[1] == ' ""':
                option[key] = ''
            else:
                option[key] += ',\n'

    for option in options:
        info['options_text'] += ('\n'
        '            {\n'
        f'                {option["audio_file"]}'
        f'                {option["sound_effect_file"]}'
        f'                {option["time_wait"]}'
        f'                {option["display_text"]}'
        f'                {option["next_text_id"]}'
        '            },')
    info['options_text'] = info['options_text'] if num_options > 0 else ''
    info['options_text'] += '\n        ]'
    for key in info.keys():
        if len(info[key].split(':')) == 1 or len(info[key].split(':')[1]) == 1 or info[key].split(':')[1] == ' ""':
            info[key] = ''
        else:
            info[key] += ',\n'




    node = ('{\n' 
    f'        {info["id"]}'
    f'        {info["voice_text"]}'
    f'        {info["options_text"]}'
    '    },\n'
    )

    print(node)

    all_nodes += node

if can_copy:
    print("Copied to clipboard!")
    pyperclip.copy(all_nodes)






