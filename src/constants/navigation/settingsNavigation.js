export const settingsNavigation = {
  icon: "Setting2",
  key: "settings",
  label: "MENU.SETTINGS.TEXT",
  path: "/settings",
  routeName: "settings",
  isItemsGrouped: true,
  items: [
    {
      id: "personal_settings",
      label: "MENU.SETTINGS.CHILDREN.PERSONAL_SETTINGS.TEXT",
      children: [
        {
          key: "profile",
          label:
            "MENU.SETTINGS.CHILDREN.PERSONAL_SETTINGS.CHILDREN.PROFILE.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.PERSONAL_SETTINGS.CHILDREN.PROFILE.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.PERSONAL_SETTINGS.CHILDREN.PROFILE.DESCRIPTION",
          icon: "ProfileCircle",
          path: "/settings/profile",
          routeName: "settings_profile",
        },
        {
          key: "notifications",
          label:
            "MENU.SETTINGS.CHILDREN.PERSONAL_SETTINGS.CHILDREN.NOTIFICATIONS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.PERSONAL_SETTINGS.CHILDREN.NOTIFICATIONS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.PERSONAL_SETTINGS.CHILDREN.NOTIFICATIONS.DESCRIPTION",
          icon: "NotificationBing",
          path: "/settings/notifications",
          routeName: "settings_notifications",
        },
      ],
    },
    {
      id: "workspace_settings",
      label: "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.TEXT",
      children: [
        {
          key: "general",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.GENERAL.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.GENERAL.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.GENERAL.DESCRIPTION",
          icon: "Buliding",
          path: "/settings/general",
          routeName: "settings_general",
        },
        {
          key: "users",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.USERS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.USERS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.USERS.DESCRIPTION",
          icon: "UserCirlceAdd",
          path: "/settings/users",
          routeName: "settings_users",
        },
        {
          key: "teams",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.TEAMS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.TEAMS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.TEAMS.DESCRIPTION",
          icon: "Profile2User",
          path: "/settings/teams",
          routeName: "settings_teams",
        },
        {
          key: "channels",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CHANNELS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CHANNELS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CHANNELS.DESCRIPTION",
          icon: "Clipboard",
          path: "/settings/channels",
          routeName: "settings_channels",
        },
        {
          key: "growth-widgets",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.GROWTH_WIDGETS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.GROWTH_WIDGETS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.GROWTH_WIDGETS.DESCRIPTION",
          icon: "Messages1",
          path: "/settings/growth-widgets",
          routeName: "settings_growth-widgets",
        },
        {
          key: "contact-fields",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CONTACT_FIELDS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CONTACT_FIELDS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CONTACT_FIELDS.DESCRIPTION",
          icon: "TagUser",
          path: "/settings/contact-fields",
          routeName: "settings_contact-fields",
        },
        {
          key: "integrations",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.INTEGRATIONS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.INTEGRATIONS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.INTEGRATIONS.DESCRIPTION",
          icon: "Link2",
          path: "/settings/integrations",
          routeName: "settings_integrations",
        },
        {
          key: "ai",
          label: "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.AI.TEXT",
          title: "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.AI.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.AI.DESCRIPTION",
          icon: "Unlimited",
          path: "/settings/ai",
          routeName: "settings_ai",
        },
        {
          key: "closing-notes",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CLOSING_NOTES.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CLOSING_NOTES.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.CLOSING_NOTES.DESCRIPTION",
          icon: "TickCircle",
          path: "/settings/closing-notes",
          routeName: "settings_closing-notes",
        },
        {
          key: "snippets",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.SNIPPETS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.SNIPPETS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.SNIPPETS.DESCRIPTION",
          icon: "Book",
          path: "/settings/snippets",
          routeName: "settings_snippets",
        },
        {
          key: "tags",
          label: "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.TAGS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.TAGS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.TAGS.DESCRIPTION",
          icon: "Tag",
          path: "/settings/tags",
          routeName: "settings_tags",
        },
        {
          key: "files",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.FILES.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.FILES.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.FILES.DESCRIPTION",
          icon: "Book1",
          path: "/settings/files",
          routeName: "settings_files",
        },
        {
          key: "data-export",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.DATA_EXPORT.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.DATA_EXPORT.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.DATA_EXPORT.DESCRIPTION",
          icon: "ExportCurve",
          path: "/settings/data-export",
          routeName: "settings_data-export",
        },
        {
          key: "data-import",
          label:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.DATA_IMPORT.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.DATA_IMPORT.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.WORKSPACE_SETTINGS.CHILDREN.DATA_IMPORT.DESCRIPTION",
          icon: "ImportCurve",
          path: "/settings/data-import",
          routeName: "settings_data-import",
        },
      ],
    },
    {
      id: "organization_settings",
      label: "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.TEXT",
      children: [
        {
          key: "organization-settings",
          label:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.DESCRIPTION",
          icon: "Buildings",
          path: "/settings/organization-settings",
          routeName: "settings_organization_settings",
        },
        {
          key: "organization-security",
          label:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_SECURITY.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_SECURITY.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_SECURITY.DESCRIPTION",
          icon: "Lock",
          path: "/settings/organization-security",
          routeName: "settings_organization_security",
        },
        {
          key: "organization-workspaces",
          label:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_WORKSPACES.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_WORKSPACES.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_WORKSPACES.DESCRIPTION",
          icon: "Buildings2",
          path: "/settings/organization-workspaces",
          routeName: "settings_organization_workspaces",
        },
        {
          key: "organization-billing",
          label:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_BILLING.TEXT",
          title:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_BILLING.TITLE",
          description:
            "MENU.SETTINGS.CHILDREN.ORGANIZATION_SETTINGS.CHILDREN.ORGANIZATION_BILLING.DESCRIPTION",
          icon: "Cards",
          path: "/settings/organization-billing",
          routeName: "settings_organization_billing",
        },
      ],
    },
  ],
};
