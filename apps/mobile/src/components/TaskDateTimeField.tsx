import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { MenuRow, Action } from './Details';
import { TextInput, Button } from './ui';
import {ScreenModal} from './ScreenModal';
import { parseTaskTime, taskTimeInput } from '../utils/task-time';
import { dateLabel } from '../utils/presentation';
export function TaskDateTimeField({ label, value, change, disabled }: { label: string; value: string; change: (value: string) => void; disabled?: boolean }) {
  const active = useRef(false), mounted = useRef(true);
  const [iosOpen,setIosOpen]=useState(false),[iosValue,setIosValue]=useState(new Date());
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (active.current) { void DateTimePickerAndroid.dismiss('date'); void DateTimePickerAndroid.dismiss('time'); } }; }, []);
  if(Platform.OS==='ios')return <><MenuRow title={label} subtitle={parseTaskTime(value)?dateLabel(parseTaskTime(value)!):'Choose date & time'} icon="calendar" disabled={disabled} onPress={()=>{setIosValue(parseTaskTime(value)?new Date(parseTaskTime(value)!):new Date());setIosOpen(true);}}/>{value&&<Action icon="x" title={`Clear ${label.toLowerCase()}`} disabled={disabled} onPress={()=>change('')}/>} {iosOpen&&<ScreenModal title={label} close={()=>setIosOpen(false)}><DateTimePicker value={iosValue} mode="datetime" display="spinner" onChange={(_,date)=>{if(date)setIosValue(date);}}/><Button title="Use this date and time" disabled={disabled} onPress={()=>{change(taskTimeInput(iosValue.toISOString()));setIosOpen(false);}}/><Button title="Cancel" onPress={()=>setIosOpen(false)}/></ScreenModal>}</>;
  if (Platform.OS !== 'android') return <TextInput accessibilityLabel={`${label} · YYYY-MM-DD HH:mm`} value={value} onChangeText={change} editable={!disabled} />;
  const iso = parseTaskTime(value);
  const open = () => {
    if (active.current || disabled) return;
    active.current = true;
    DateTimePickerAndroid.open({ value: iso ? new Date(iso) : new Date(), mode: 'date', onChange: (event, day) => {
      if (!mounted.current) return;
      if (event.type !== 'set' || !day) { active.current = false; return; }
      DateTimePickerAndroid.open({ value: day, mode: 'time', is24Hour: false, onChange: (timeEvent, time) => {
        active.current = false;
        if (mounted.current && timeEvent.type === 'set' && time) change(taskTimeInput(time.toISOString()));
      } });
    } });
  };
  return <><MenuRow title={label} subtitle={iso ? dateLabel(iso) : 'Choose date & time'} icon="calendar" disabled={disabled} onPress={open} />{value && <Action icon="x" title={`Clear ${label.toLowerCase()}`} disabled={disabled} onPress={() => change('')} />}</>;
}
