import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.MENU.TEXT',
        isTitle: true
    },
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'home',
        link: '/',
    },
    {
        id: 100,
        label: 'Destinations',
        icon: 'map-pin',
        link: '/destinations',
    },
    {
        id: 104,
        label: 'Hotels',
        icon: 'home',
        link: '/hotels',
    },
    {
        id: 101,
        label: 'Tours',
        icon: 'briefcase',
        subItems: [
            {
                id: 102,
                label: 'Tour Category',
                link: '/tour-categories',
                parentId: 101
            },
            {
                id: 103,
                label: 'Tours',
                link: '/tours',
                parentId: 101
            }
        ]
    },
    {
        id: 105,
        label: 'Settings',
        icon: 'settings',
        subItems: [
            {
                id: 106,
                label: 'Home Page Slider',
                link: '/settings/home-page-slider',
                parentId: 105
            },
            {
                id: 108,
                label: 'Gallery',
                link: '/settings/gallery',
                parentId: 105
            },
            {
                id: 107,
                label: 'Contact Details',
                link: '/settings/contact-details',
                parentId: 105
            },
            {
                id: 109,
                label: 'Contact Submissions',
                link: '/settings/contact-submissions',
                parentId: 105
            },
            {
                id: 110,
                label: 'Newsletter',
                link: '/settings/newsletter',
                parentId: 105
            }
        ]
    }
];

