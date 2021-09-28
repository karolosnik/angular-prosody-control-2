import { ngAfterViewInit, Component, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

/**
 * @title Basic slider
 */
@Component({
  selector: 'slider-overview-example',
  templateUrl: 'slider-overview-example.html',
  styleUrls: ['slider-overview-example.css'],
})
export class SliderOverviewExample {
  checked = false;
  indeterminate = false;
  labelPosition: 'before' | 'after' = 'after';
  loader: boolean = false;
  showInstr: boolean = false;
  private sort: MatSort;
  selectedText: SelectedText = { phrase: '', position: -1 };

  ngAfterViewInit() {
    document.addEventListener('click', this.onAllClicks.bind(this));
  }

  onAllClicks(event) {
    if (
      this.showInstr == true ||
      event.target.id.includes('show-instructions') ||
      event.target.parentElement?.id.includes('show-instructions') ||
      event.target.parentElement?.parentElement?.id.includes(
        'show-instructions'
      )
    ) {
      return;
    }
    if (
      document.getSelection()?.type == 'None' ||
      document.getSelection()?.type == 'Caret'
    ) {
      if (!this.showInstr) {
        this.selectedText.phrase = '';
        let h1ElemOriginal = <HTMLElement>(
          document.querySelector('#sentence-original')
        );
        let h1ElemShowIntr = <HTMLElement>(
          document.querySelector('#sentence-show-instructions')
        );
        h1ElemShowIntr.innerHTML = h1ElemOriginal.innerHTML;
        this.showInstr = false;
      }
    }
  }

  tiles: Tile[] = [
    { cols: 4, rows: 1, text: 'energy  ', disabled: true, value: 0 },
    { cols: 4, rows: 1, text: 'F0      ', disabled: true, value: 0 },
    { cols: 4, rows: 1, text: 'duration', disabled: true, value: 0 },
  ];

  utterances = ['kalispera paidia', 'siga min to ftiaxv pote'];

  giveInstuctions() {
    this.showInstr = true;
    let h1ElemOriginal = <HTMLElement>(
      document.querySelector('#sentence-original')
    );
    let sentence = h1ElemOriginal.innerText.trim();
    let h1Elem = <HTMLElement>(
      document.querySelector('#sentence-show-instructions')
    );
    let words = sentence.split(' ');
    let left_i = sentence.indexOf(words[1]);
    let right_i = left_i + words[1].length;
    let wavButton = <HTMLElement>document.querySelector('#get-wav-button');

    var i = left_i;

    function myLoop() {
      setTimeout(function () {
        if (i <= right_i) {
          let leftPart = sentence.slice(0, left_i);
          let centerPart = sentence.slice(left_i, i);
          let rightPart = sentence.slice(i);
          h1Elem.innerHTML =
            '<span>' +
            leftPart +
            "</span><span style='background-color: blue; color: white;'>" +
            centerPart +
            '</span>' +
            rightPart +
            '<span>';
          i++;
          myLoop();
        } else {
          wavButton.click();
        }
      }, 500);
    }

    myLoop();
    this.tiles[0].disabled = false;
    this.tiles[0].value = 0.7;
    this.tiles[1].disabled = false;
    this.tiles[1].value = -0.3;
    this.selectedText.phrase = words[1];
    this.selectedText.position = left_i;
  }

  trackHighlightedText() {
    let anchorOffset = document.getSelection()?.anchorOffset || null;
    let focusOffset = document.getSelection()?.focusOffset || null;
    let phrase = document.getSelection()?.toString() || '';

    let position = -1;
    if (anchorOffset && focusOffset) {
      this.selectedText.position = Math.min(anchorOffset, focusOffset);
      this.selectedText.phrase = phrase;
      console.log(this.selectedText);
    }
  }

  AsyncData() {
    const energyVal = this.tiles[0].disabled ? 'default' : this.tiles[0].value;
    const f0Val = this.tiles[1].disabled ? 'default' : this.tiles[1].value;
    const durationVal = this.tiles[2].disabled
      ? 'default'
      : this.tiles[2].value;
    var left = 'kalispera kai kali vradia'.slice(
      0,
      this.selectedText.position - 1
    );
    var center = 'kalispera kai kali vradia'.slice(
      this.selectedText.position - 1,
      this.selectedText.position + this.selectedText.phrase.length - 1
    );
    var right = 'kalispera kai kali vradia'.slice(
      this.selectedText.position + this.selectedText.phrase.length - 1
    );
    ELEMENT_DATA.push({
      phrase: { left: left, center: center, right: right },
      energy: energyVal,
      f0: f0Val,
      duration: durationVal,
      wav: 'wav',
    });

    console.log(this.selectedText.position, this.selectedText.phrase.length);

    this.loader = false;
    this.tiles[0].disabled = false;
    this.tiles[0].value = 0;
    this.tiles[1].disabled = false;
    this.tiles[1].value = 0;
    this.tiles[2].disabled = false;
    this.tiles[2].value = 0;
    this.showInstr = false;
    this.selectedText.phrase = '';
  }

  synthesize() {
    this.loader = true;

    setTimeout(this.AsyncData.bind(this), 3000);
  }

  //table
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.dataSource.sort = this.sort;
  }
  displayedColumns: string[] = [
    'select',
    'phrase',
    'energy',
    'f0',
    'duration',
    'wav',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }
}

let ELEMENT_DATA: PeriodicElement[] = [];

export interface Tile {
  cols: number;
  rows: number;
  text: string;
  disabled: boolean;
  value: number;
}

export interface PeriodicElement {
  phrase: { left: string; center: string; right: string };
  energy: number | string;
  f0: number | string;
  duration: number | string;
  wav: string;
}

export interface SelectedText {
  phrase: string;
  position: number;
}
/**  Copyright 2020 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */
