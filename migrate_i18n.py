import os
import re

def migrate_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace imports
    if 'useLang' in content or 'LangContext' in content:
        content = re.sub(
            r'import\s+\{[^}]*useLang[^}]*\}\s+from\s+["\'][^"\']*LangContext["\'];?',
            'import { useTranslations, useLocale } from "next-intl";\nimport LanguageSwitcher from "@/app/components/LanguageSwitcher";',
            content
        )
        content = re.sub(
            r'import\s+LangContext.*?;\n',
            '',
            content
        )

    # Replace hook calls
    # const { locale, setLocale, t } = useLang();
    # const { locale: lang, setLocale: setLang } = useLang();
    # const { lang } = useLang();
    content = re.sub(
        r'const\s+\{\s*locale.*?t\s*\}\s*=\s*useLang\(\);',
        'const locale = useLocale();\n  const t = useTranslations();',
        content
    )
    content = re.sub(
        r'const\s+\{\s*locale\s*:\s*lang.*?setLang\s*\}\s*=\s*useLang\(\);',
        'const lang = useLocale();\n  const t = useTranslations();',
        content
    )
    content = re.sub(
        r'const\s+\{\s*lang\s*\}\s*=\s*useLang\(\);',
        'const lang = useLocale();\n  const t = useTranslations();',
        content
    )
    content = re.sub(
        r'const\s+\{\s*locale\s*,\s*setLocale\s*\}\s*=\s*useLang\(\);',
        'const locale = useLocale();\n  const t = useTranslations();',
        content
    )

    # Replace t("section", "key") with t("section.key")
    content = re.sub(
        r't\(\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']\s*\)',
        r't("\1.\2")',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            migrate_file(filepath)
