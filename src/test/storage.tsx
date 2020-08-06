import { createNamespace } from '@/storage/local-storage';

export const namespace = 'react-common';
export const version = '1.0.0';

export const localStorage = createNamespace(namespace, version);