export interface Breadcrumb {
    text: string;
    to?: string;
    exact: boolean;
    disabled: boolean;
    copy?: {
        value: string;
        label: string;
    }
}

export class RootState {
    loadingCount = 0;
    breadcrumbs: Breadcrumb[] = [];
}
