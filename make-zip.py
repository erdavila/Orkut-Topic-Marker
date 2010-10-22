#!/bin/env python
import json
import os.path
import shutil
import tempfile
import subprocess


ZIP_FILE = "otm.zip"
BOM = "\xef\xbb\xbf"


tmp_dir = tempfile.mkdtemp(prefix="crx-", suffix=".tmp")
dst_dir = os.path.join(tmp_dir, "otm")

shutil.copytree("src", dst_dir)

manifest_file = os.path.join(dst_dir, "manifest.json")
with open(manifest_file, 'r') as f:
	data = f.read()

with_bom = data.startswith(BOM)
if with_bom:
	data = data[len(BOM):]
	

manifest = json.loads(data)
del manifest['key']


with open(manifest_file, 'w') as f:
	if with_bom:
		f.write(BOM)
	
	json.dump(manifest, f, indent=4)


# Remove zip atual
if os.path.isfile(ZIP_FILE):
	os.remove(ZIP_FILE)


print "Criando", ZIP_FILE
cur_dir = os.path.abspath(".")
os.chdir(tmp_dir)
subprocess.check_call(["zip", "-r", ZIP_FILE, "otm"])
shutil.move(ZIP_FILE, cur_dir)
os.chdir(cur_dir)


shutil.rmtree(tmp_dir)
