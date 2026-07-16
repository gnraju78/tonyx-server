import mongoose, { Schema, Document } from 'mongoose';

interface IPhoto extends Document {
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  album?: mongoose.Types.ObjectId;
  collection?: mongoose.Types.ObjectId;
  photographer: mongoose.Types.ObjectId;
  likes: number;
  views: number;
  metadata?: {
    width?: number;
    height?: number;
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface IAlbum extends Document {
  title: string;
  description?: string;
  photographer: mongoose.Types.ObjectId;
  photos: mongoose.Types.ObjectId[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ICollection extends Document {
  title: string;
  description?: string;
  photographer: mongoose.Types.ObjectId;
  albums: mongoose.Types.ObjectId[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<IPhoto>(
  {
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    thumbnail: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    metadata: {
      width: Number,
      height: Number,
      camera: String,
      lens: String,
      iso: Number,
      aperture: String,
      shutter: String,
    },
  },
  { timestamps: true }
);

const albumSchema = new Schema<IAlbum>(
  {
    title: { type: String, required: true },
    description: { type: String },
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
    coverImage: { type: String },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const collectionSchema = new Schema<ICollection>(
  {
    title: { type: String, required: true },
    description: { type: String },
    photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
    coverImage: { type: String },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Photo = mongoose.models.Photo || mongoose.model<IPhoto>('Photo', photoSchema);
export const Album = mongoose.models.Album || mongoose.model<IAlbum>('Album', albumSchema);
export const Collection = mongoose.models.Collection || mongoose.model<ICollection>('Collection', collectionSchema);
