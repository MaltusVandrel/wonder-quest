export abstract class ColorUtils {
  public static colorToInteger(color: Phaser.Display.Color): number {
    return ColorUtils.hexToInteger(this.colorToHex(color));
  }
  public static integerToColor(integer: number): Phaser.Display.Color {
    return ColorUtils.hexToColor(integer.toString(16));
  }

  public static channelToHex(channel: number): string {
    var hex = channel.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
  public static rgbToHexString(r: number, g: number, b: number): string {
    return (
      '0x' +
      ColorUtils.channelToHex(r) +
      ColorUtils.channelToHex(g) +
      ColorUtils.channelToHex(b)
    );
  }
  public static hexToColor(hexColor: string): Phaser.Display.Color {
    return Phaser.Display.Color.ValueToColor(hexColor);
  }
  public static hexToInteger(hexColor: string): number {
    return parseInt(hexColor, 16);
  }
  public static colorToHex(color: Phaser.Display.Color): string {
    return this.rgbToHexString(color.red, color.green, color.blue);
  }
}
