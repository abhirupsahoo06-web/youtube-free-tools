export type AspectRatioOption = 'free' | 'original' | '16:9' | '9:16' | '1:1' | '4:5' | '4:3'

export interface CropRect {
  x: number      // in natural media pixels
  y: number      // in natural media pixels
  width: number  // in natural media pixels
  height: number // in natural media pixels
}

export type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move'
