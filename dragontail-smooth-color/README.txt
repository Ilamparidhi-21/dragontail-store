DRAGONTAIL mobile Quick View color responsiveness patch

Upload ZIP to EC2 home directory.
cd ~/dragontail
unzip -o ~/DRAGONTAIL-smooth-color-switch.zip -d ~/dragontail
python3 dragontail-smooth-color/apply.py
npm run build
# Restart ONLY after success:
pm2 restart dragontail --update-env
pm2 save

Preloads first photo for available colors when Quick View opens, refreshes image by color key, and avoids reselecting the same color. If a photo is slow from S3, network transfer still affects the first uncached load. This does not alter product variant inventory or database.
