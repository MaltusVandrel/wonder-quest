import { Injectable } from '@angular/core';
import { MapRegion } from 'src/data/bank/map-region';
import { HERO_BUILDER } from 'src/data/builder/hero-builder';
import { Biome } from 'src/models/biome';
import { Figure } from 'src/models/figure';
import { Party } from 'src/models/party';
export interface TimeData {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
export interface GameData {
  /**
   * @description it's in minutes
   *   */
  time: number;
  /**
   * @description it's the player, duh
   *   */
  playerData: Figure;
  mapSeed: string;
  mapPos: { x: number; y: number };
  playerPos: { x: number; y: number };
  registeredRegions: Array<MapRegion>;
  encounterData: { [key: string]: any };
}
export interface OveralGameDataParamter {
  biome?: Biome;
  pos?: { x: number; y: number };
  party?: Party;
}

export class GameDataService {
  static STORAGE_KEY = 'wonder-quest-game-data';
  private number = 0;
  static INITIAL_TIME = Math.round(Math.random() * 1000 * 364 * 24 * 60);
  static LEFTOVERS = this.INITIAL_TIME % 60;
  static GAME_DATA: GameData = {
    time: this.INITIAL_TIME - this.LEFTOVERS + 0.1,
    playerData: HERO_BUILDER.getAHero(1),
    mapSeed: Math.random() + '',
    mapPos: { x: 0, y: 0 },
    playerPos: { x: 0, y: 0 },
    registeredRegions: [],
    encounterData: {},
  };

  constructor() {}
  static getTimeData(
    totalMinutes: number = GameDataService.GAME_DATA.time
  ): TimeData {
    const secondsInAMinute = 60;
    const minutesInAHour = 60;
    const hoursInADay = 24;
    const daysInAMonth = 28;
    const monthsInAYear = 12;
    const daysInAYear = daysInAMonth * monthsInAYear;
    const minutesInADay = hoursInADay * minutesInAHour;
    const minutesInAMonth = daysInAMonth * minutesInADay;
    const minutesInAYear = daysInAYear * minutesInADay;

    let year = totalMinutes / minutesInAYear;
    let month = (year % 1) * monthsInAYear;
    let day = (month % 1) * daysInAMonth;
    let hour = (day % 1) * hoursInADay;
    let minutes = (hour % 1) * minutesInAHour;
    let seconds = (minutes % 1) * secondsInAMinute;

    let f = (n: number): number => {
      return Math.floor(n);
    };
    return {
      years: f(year),
      months: f(month),
      days: f(day),
      hours: f(hour),
      minutes: f(minutes),
      seconds: f(seconds),
    };
  }

  static getFormattedTime(
    totalMinutes: number = GameDataService.GAME_DATA.time
  ) {
    const formatNumber = (num: number) => num.toString().padStart(2, '0');
    const timeData: any = this.getTimeData(totalMinutes);
    timeData.months++;
    timeData.days++;
    const timeDataFormatted: any = {};
    for (const key of Object.keys(timeData)) {
      timeDataFormatted[key] = formatNumber(timeData[key]);
    }
    return timeDataFormatted;
  }
  // Save data to localStorage
  static saveData(): void {
    this.GAME_DATA.playerData = Figure.untieCircularReference(
      this.GAME_DATA.playerData
    );
    localStorage.setItem(
      GameDataService.STORAGE_KEY,
      JSON.stringify(this.GAME_DATA)
    );
  }

  // Load data from localStorage
  static loadData(): any {
    const data = localStorage.getItem(GameDataService.STORAGE_KEY);
    this.GAME_DATA = { ...this.GAME_DATA, ...JSON.parse(data ?? '') };
    this.GAME_DATA.playerData = Figure.instantiate(this.GAME_DATA.playerData);
  }
  static existsData(): any {
    const data = localStorage.getItem(GameDataService.STORAGE_KEY);
    return !(data == null);
  }

  // Clear data from localStorage
  static clearData(): void {
    localStorage.removeItem(GameDataService.STORAGE_KEY);
  }
}
