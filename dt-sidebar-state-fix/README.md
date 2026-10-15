DRAGONTAIL shared sidebar state fix

- Overview is open by default for users without a stored preference.
- Clicking Overview toggles the group without navigating.
- The expand/collapse preference is preserved across page navigation/reloads using browser localStorage.
- ChevronRight/ChevronDown replace plus/minus.
- Orders/Products/Collections highlighting is determined by the current URL.
- No database, API, inventory or auth changes.

Deploy:
cd ~/dragontail
unzip -o ~/DRAGONTAIL-sidebar-state-fix.zip -d ~/dragontail
python3 dt-sidebar-state-fix/apply.py
NODE_OPTIONS=--max-old-space-size=1536 npm run build
# Only on success:
pm2 restart dragontail --update-env
pm2 save
