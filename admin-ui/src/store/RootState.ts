export interface Breadcrumb {
    text: string,
    to?: string,
    exact: boolean,
    disabled: boolean,
}

export class RootState {
    loadingCount = 0;
    breadcrumbs: Breadcrumb[] = [];
}
