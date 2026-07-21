import type { Types } from 'mongoose';

export interface LocationAddress {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
}

export interface LocationCoordinates {
  latitude?: number;
  longitude?: number;
}

export interface DayHours {
  open?: string;
  close?: string;
  isOpen?: boolean;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface LocationImage {
  public_id: string;
  url: string;
}

export interface ILocation {
  readonly _id: Types.ObjectId;
  name: string;
  address: LocationAddress;
  coordinates?: LocationCoordinates;
  phone?: string;
  email?: string;
  workingHours: WorkingHours;
  image?: LocationImage;
  capacity?: number;
  amenities: string[];
  staff: Types.ObjectId[];
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
