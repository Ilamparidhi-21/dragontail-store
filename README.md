DRAGONTAIL sidebar-only patch. Applies a shared sidebar to Orders, Products and Collections. Overview defaults expanded, all three items shown together, current page uses thin white indicator. No database modifications.
Upload ZIP to /home/ubuntu then run in ~/dragontail:
unzip -o ~/DRAGONTAIL-shared-admin-sidebar.zip -d ~/dragontail
python3 dt-sidebar/apply.py
NODE_OPTIONS='--max-old-space-size=1536' npm run build
Only after success: pm2 restart dragontail --update-env && pm2 save
