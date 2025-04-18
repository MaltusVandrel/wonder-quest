import { Injectable } from '@angular/core';
import { MapRegion } from 'src/data/bank/map-region';
import { HERO_BUILDER } from 'src/data/builder/hero-builder';
import { Biome } from 'src/models/biome';
import { Figure } from 'src/models/figure';
import { Company } from 'src/models/company';
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
  companyData: Company;
  mapSeed: string;
  mapPos: { x: number; y: number };
  playerPos: { x: number; y: number };
  screenSize: { x: number; y: number };
  registeredRegions: Array<MapRegion>;
  encounterData: { [key: string]: any };
}
export interface OveralGameDataParamter {
  biome?: Biome;
  pos?: { x: number; y: number };
  company?: Company;
  encounterTriggerType?: string;
}

export class GameDataService {
  static STORAGE_KEY = 'wonder-quest-game-data';
  private number = 0;
  static INITIAL_TIME = Math.round(Math.random() * 1000 * 364 * 24 * 60);
  static LEFTOVERS = this.INITIAL_TIME % 60;
  static secondsInAMinute = 60;
  static minutesInAHour = 60;
  static hoursInADay = 24;
  static daysInAMonth = 28;
  static daysInAWeek = GameDataService.daysInAMonth / 4;
  static daysInASeason =
    GameDataService.daysInAMonth * 4 + GameDataService.daysInAWeek;
  static monthsInAYear = 13;
  static daysInAYear =
    GameDataService.daysInAMonth * GameDataService.monthsInAYear;
  static minutesInADay =
    GameDataService.hoursInADay * GameDataService.minutesInAHour;
  static minutesInAMonth =
    GameDataService.daysInAMonth * GameDataService.minutesInADay;
  static minutesInAYear =
    GameDataService.daysInAYear * GameDataService.minutesInADay;

  static GAME_DATA: GameData = {
    time: this.INITIAL_TIME - this.LEFTOVERS + 0.1,
    companyData: new Company(),
    mapSeed: Math.random() + '',
    mapPos: { x: 0, y: 0 },
    playerPos: { x: 0, y: 0 },
    screenSize: { x: 0, y: 0 },
    registeredRegions: [],
    encounterData: {},
  };

  constructor() {}
  static getTimeData(
    totalMinutes: number = GameDataService.GAME_DATA.time
  ): TimeData {
    let year = totalMinutes / GameDataService.minutesInAYear;
    let month = (year % 1) * GameDataService.monthsInAYear;
    let day = (month % 1) * GameDataService.daysInAMonth;
    let hour = (day % 1) * GameDataService.hoursInADay;
    let minutes = (hour % 1) * GameDataService.minutesInAHour;
    let seconds = (minutes % 1) * GameDataService.secondsInAMinute;

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
    this.GAME_DATA.companyData = Company.untieCircularReference(
      this.GAME_DATA.companyData
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
    this.GAME_DATA.companyData = Company.instantiate(
      this.GAME_DATA.companyData
    );
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
