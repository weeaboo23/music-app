# Generated by Django 5.2.1 on 2025-05-22 21:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='onlinetrack',
            old_name='straum_url',
            new_name='stram_url',
        ),
    ]
