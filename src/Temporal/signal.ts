import { defineSignal } from '@temporalio/workflow';

export interface JoinInput {
    targetedProduct: string | null;
    productType: string | null;
}

export const productRecommendationSignal = defineSignal<[JoinInput]>('join');