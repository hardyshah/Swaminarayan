import sys,importlib.util
spec=importlib.util.spec_from_file_location('lmg','' + __import__('os').environ.get('LMG','/mnt/project-files/directory/build/lmg.py') + '');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
m.M.update({'t':'ા','k':'ં','Ë':'સ','‚':'ત','Œ':'દ'})
for line in open(sys.argv[1],encoding='utf-8'):
    if line.startswith('\f'): print('\f',end=''); line=line[1:]
    r=m.conv(line.rstrip('\n'))
    if r is not None: print(r)
