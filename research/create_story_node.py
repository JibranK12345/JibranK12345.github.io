#run pip install -r requirements.txt
can_copy = True
try:
    import pyperclip
except ImportError as e:
    print("pyperclip not found!")
    can_copy = False
    pass

info = dict()
info['id'] = 'id: ' + input('id: ')
info['voice_text'] = 'text: ' + '"' + input('voice_text: ') + '"'
num_options = input('num_options: ')
num_options = int(num_options) if num_options else 0
options = [0] * int(num_options)
info['options_text'] = 'options: ['

for i in range (num_options):
    options[i] = dict()
    print("Option", i+1, ":")
    options[i]['audio_file'] = 'audio: ' + '"' + input('audio_file: ') + '"'
    options[i]['sound_effect_file'] = 'soundEffect: ' + '"' + input('sound_effect_file: ') + '"'
    options[i]['time_wait'] = 'timeWait: ' + input('time_wait: ')
    options[i]['display_text'] = 'text: ' + '"' + input('display_text: ') + '"'
    options[i]['next_text_id'] = 'nextText: ' + input('next_text_id: ')

for option in options:
    for key in option.keys():
        if len(option[key].split(':')[1]) == 1:
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


# info['options_text'] =  '[\n'
# '            {\n'
# f'                {info["audio_file"]}'
# f'                {info["sound_effect_file"]}'
# f'                {info["time_wait"]}'
# f'                {info["display_text"]}'
# f'                {info["next_text_id"]}'
# '            }\n'
# '       ]\n'
# '    },\n'

info['options_text'] += '\n        ]'
for key in info.keys():
    if len(info[key].split(':')[1]) == 1:
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
if can_copy:
    print("Copied to clipboard!")
    pyperclip.copy(node)







