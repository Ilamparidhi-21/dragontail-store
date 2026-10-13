DRAGONTAIL navigation mini-patch (Phase 5 compatible)

Adds HOME in the desktop header before WOMEN and in the mobile side menu.
HOME resets the collection/search and smoothly returns to the homepage top.
Adds a profile icon immediately after the shopping bag, linking to /account.
/account is explicitly a coming-soon screen, not customer authentication.

Deploy:
cd ~/dragontail
cp src/app/page.tsx src/app/page.tsx.before-home-profile
unzip -o ~/DRAGONTAIL-home-profile-patch.zip
npm run build
# Only after successful build:
pm2 restart dragontail --update-env
pm2 save

This patch is based on the Phase 5 storefront code. If you have independently edited src/app/page.tsx, inspect changes before overwriting it.
