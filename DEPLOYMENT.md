# Deployment Guide

## Pre-Deployment Checklist

### 1. Database Preparation

If migrating from Django 2:

```bash
# Backup your existing database
pg_dump your_db_name > backup.sql

# Test the migration in a staging environment first
```

### 2. Environment Variables Setup

Create these secrets in Render:

**Backend:**
- `DJANGO_SECRET_KEY` (generate with: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
- `JWT_SECRET` (use a different random key)
- `MAGIC_LINK_SECRET` (use a different random key)
- `ALLOWED_HOSTS` (your backend domain)
- `CORS_ALLOWED_ORIGINS` (your frontend domain)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SES_REGION`
- `DEFAULT_FROM_EMAIL`

**Frontend:**
- `PUBLIC_API_URL` (your backend URL + /api)

### 3. Amazon SES Setup

1. Go to AWS SES console
2. Verify your domain or email address
3. Request production access (remove sandbox mode)
4. Create IAM user with SES send permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```
5. Generate access key for the IAM user

## Deployment Steps

### Option A: Deploy to Render with Blueprint

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

2. In Render Dashboard:
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml`
   - Review the services and database
   - Click "Apply"

3. After deployment completes, run migrations:
   - Go to the backend service shell
   - Run: `python backend/manage.py migrate`
   - Create superuser: `python backend/manage.py createsuperuser`

### Option B: Manual Service Creation

#### Backend Service

1. Create Web Service:
   - Runtime: Python
   - Build Command: `cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start Command: `cd backend && gunicorn config.wsgi:application`

2. Add environment variables (see checklist above)

3. After first deployment, run migrations in shell:
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

#### Frontend Service

1. Create Web Service:
   - Runtime: Node
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && node ./dist/server/entry.mjs`

2. Add environment variable:
   - `PUBLIC_API_URL`: Your backend URL + /api

## Using Amazon RDS Instead of Render PostgreSQL

### 1. Create RDS Instance

1. Go to AWS RDS console
2. Create PostgreSQL database:
   - Engine: PostgreSQL 14+
   - Instance class: db.t3.micro (or larger for production)
   - Storage: 20GB minimum
   - Enable automated backups
   - Set retention period

3. Configure Security Group:
   - Add inbound rule for PostgreSQL (5432)
   - Source: Render IP ranges (check Render docs for current ranges)

4. Note the endpoint, port, database name, username, and password

### 2. Update Render Configuration

In `render.yaml`, remove the `databases` section:

```yaml
services:
  - type: web
    name: cmneo-backend
    # ... other config
    envVars:
      - key: DATABASE_URL
        value: postgresql://username:password@your-rds-endpoint:5432/dbname
```

Or set `DATABASE_URL` in Render dashboard as a secret.

### 3. Initial Database Setup

Connect to your RDS instance and run:

```bash
# From Render shell or local with RDS access
cd backend
python manage.py migrate
python manage.py createsuperuser
```

## Migrating Existing Django 2 Data

### If Using Same Database

1. **Create a complete backup first!**

2. Update to point to your existing database

3. Create a fake initial migration:
```bash
python manage.py migrate --fake-initial
```

4. Run new migrations:
```bash
python manage.py migrate
```

5. Test authentication thoroughly

### If Using New Database

1. Export from old database:
```bash
# In old project
python manage.py dumpdata auth.User --natural-foreign --natural-primary > users.json
```

2. Create import script in `backend/apps/authentication/management/commands/import_users.py`:

```python
from django.core.management.base import BaseCommand
import json
from apps.authentication.models import User

class Command(BaseCommand):
    help = 'Import users from Django 2 export'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str)

    def handle(self, *args, **options):
        with open(options['json_file'], 'r') as f:
            data = json.load(f)

        for item in data:
            fields = item['fields']
            User.objects.create(
                id=item['pk'],
                email=fields['email'],
                password=fields['password'],  # Already hashed
                first_name=fields.get('first_name', ''),
                last_name=fields.get('last_name', ''),
                is_active=fields['is_active'],
                is_staff=fields.get('is_staff', False),
                is_superuser=fields.get('is_superuser', False),
                date_joined=fields['date_joined'],
                last_login=fields.get('last_login'),
            )

        self.stdout.write(self.style.SUCCESS(f'Imported {len(data)} users'))
```

3. Run import:
```bash
python manage.py import_users users.json
```

## Post-Deployment

### 1. Verify Services

- Backend health: `https://your-backend.onrender.com/api/docs`
- Frontend: `https://your-frontend.onrender.com/`
- Test registration and login
- Test magic link email delivery

### 2. Monitor Logs

Check logs in Render dashboard for both services

### 3. Set Up Monitoring

Consider adding:
- Error tracking (Sentry)
- Uptime monitoring
- Performance monitoring

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
python manage.py dbshell

# Check migrations
python manage.py showmigrations

# If migrations are out of sync
python manage.py migrate --fake
```

### Email Not Sending

1. Check AWS SES sandbox mode
2. Verify email addresses/domains
3. Check IAM permissions
4. Verify environment variables
5. Check CloudWatch logs in AWS

### CORS Errors

1. Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
2. Check that URLs match exactly (http vs https, trailing slash)
3. Ensure `corsheaders` middleware is before `CommonMiddleware`

### Static Files Not Loading

```bash
# Collect static files
python manage.py collectstatic --noinput

# Verify STATIC_ROOT and STATIC_URL in settings
```

## Scaling Considerations

### Database

- Enable connection pooling
- Add read replicas for read-heavy workloads
- Monitor slow queries
- Add database indexes as needed

### Application

- Increase Render instance size
- Enable autoscaling
- Add caching (Redis)
- Use CDN for static files

### Security

- Enable database encryption at rest
- Use secrets manager for sensitive data
- Regular security updates
- Implement rate limiting
- Add monitoring and alerts
