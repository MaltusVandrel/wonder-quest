import { Injectable } from '@angular/core';
import moment from 'moment';
import { GameData } from 'src/core/game-data';
import { HERO_BUILDER } from 'src/data/builder/hero-builder';
import { Figure } from 'src/models/figure';

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
  };

  constructor() {}
  static getTimeData() {
    const minutesInAHour = 60;
    const hoursInADay = 24;
    const daysInAMonth = 28;
    const monthsInAYear = 12;
    const daysInAYear = daysInAMonth * monthsInAYear;
    const minutesInADay = hoursInADay * minutesInAHour;
    const minutesInAMonth = daysInAMonth * minutesInADay;
    const minutesInAYear = daysInAYear * minutesInADay;

    const totalMinutes = GameDataService.GAME_DATA.time;

    let year = totalMinutes / minutesInAYear;
    let month = (year % 1) * monthsInAYear;
    let day = (month % 1) * daysInAMonth;
    let hour = (day % 1) * hoursInADay;
    let minutes = (hour % 1) * minutesInAHour;

    let f = (n: number): number => {
      return Math.floor(n);
    };
    return {
      year: f(year),
      month: f(month),
      day: f(day),
      hour: f(hour),
      minutes: f(minutes),
    };
  }
  static getFormattedTime() {
    const formatNumber = (num: number) => num.toString().padStart(2, '0');
    const timeData: any = this.getTimeData();
    timeData.month++;
    timeData.day++;
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
