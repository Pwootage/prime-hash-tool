import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {calcCRC32, hex} from '../utils/crc32';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {HashFinderService, AssetID, AssetPath, HashMatchResults} from '../utils/HashFinderService';
import 'rxjs/add/operator/share';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  input = new BehaviorSubject<string>(' ');
  crc32: Observable<number>;
  crc32Str: Observable<string>;
  matchResults: Observable<HashMatchResults>;
  latestMatch: HashMatchResults;

  constructor(private hashFinder: HashFinderService) {
  }

  ngOnInit(): void {
    this.crc32 = this.input
      .map(calcCRC32);

    this.matchResults = this.input
      .debounceTime(1000)
      .map(v => this.hashFinder.findHash(v, {}))
      .share();

    this.matchResults.subscribe((v) => {
      this.latestMatch = v;
    });

    // this.input.next('$/worlds/introllevel/!intro_master/cooked/!intro_master.mwld');
    this.input.next('');

    // const count = 1 * 1000 * 1000;
    // const start = performance.now();
    // for (let i = 0; i < count; i++) {
    //   calcCRC32(`str-${i}-012345678901234567890123456789`);
    // }
    // const end = performance.now();
    // console.log(`${count} hashes in ${end - start}ms`);
  }
}
