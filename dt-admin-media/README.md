DRAGONTAIL Admin Media & Navigation Patch

Deployment: unzip in ~/dragontail, npm install @aws-sdk/client-s3, configure DT_MEDIA_BUCKET and DT_MEDIA_REGION, attach EC2 instance IAM role with s3:PutObject on arn:aws:s3:::BUCKET/products/*, then python3 dt-admin-media/apply.py, npm run build. Restart PM2 only on successful build.

Images upload into existing S3 bucket products/ and inherit its existing read policy. Do not add public-write permissions or AWS keys to environment files. Existing URLs remain editable. Max 5 MB/image. Single-image buffers are held in memory during each request; restrict admin upload concurrency. The API validates the admin session, MIME type and file signatures; for production add image decoding/re-encoding, rate limits, and CloudFront.

Native action menus close when another opens or on outside click/Escape. Overview opens by default on each admin page.
