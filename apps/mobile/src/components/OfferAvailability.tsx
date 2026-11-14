import React from 'react';
import type { OfferAvailabilityDto } from '@team517/contracts';
import { View } from 'react-native';
import { Text } from './ui';
import { taskWhenLabel } from '../utils/design-presentation';
import { theme as t } from '../theme';
export function OfferAvailability({value}:{value:OfferAvailabilityDto}) {
 const label = ({COVERS_TASK:'✓ Covers task time',PARTIAL_OVERLAP:'◷ Partially available',CONFLICT:'! Time conflict',NOT_PROVIDED:'Availability not provided'})[value.availabilityFit ?? 'NOT_PROVIDED'];
 return <View style={{gap:8,borderLeftWidth:3,borderColor:t.colors.border,paddingLeft:12}}><Text style={{fontWeight:'600'}}>{label}</Text>{value.availableFrom && value.availableUntil && <Text>Available {taskWhenLabel(value.availableFrom,value.availableUntil)}</Text>}</View>;
}
