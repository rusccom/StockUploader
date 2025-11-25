declare module 'piexifjs' {
  export interface IExif {
    '0th': Record<number, any>;
    Exif: Record<number, any>;
    GPS: Record<number, any>;
    Interop: Record<number, any>;
    '1st': Record<number, any>;
    thumbnail?: string;
  }

  export const ImageIFD: {
    ImageDescription: number;
    Make: number;
    Model: number;
    Orientation: number;
    XResolution: number;
    YResolution: number;
    ResolutionUnit: number;
    Software: number;
    DateTime: number;
    Artist: number;
    Copyright: number;
  };

  export const ExifIFD: {
    ExposureTime: number;
    FNumber: number;
    ExposureProgram: number;
    ISOSpeedRatings: number;
    DateTimeOriginal: number;
    DateTimeDigitized: number;
    ShutterSpeedValue: number;
    ApertureValue: number;
    BrightnessValue: number;
    ExposureBias: number;
    MaxApertureValue: number;
    MeteringMode: number;
    Flash: number;
    FocalLength: number;
    ColorSpace: number;
    PixelXDimension: number;
    PixelYDimension: number;
  };

  export const GPSIFD: {
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
    GPSAltitudeRef: number;
    GPSAltitude: number;
  };

  export function load(data: string): IExif;
  export function dump(exifObj: IExif): string;
  export function insert(exifBytes: string, jpegData: string): string;
  export function remove(jpegData: string): string;
}

