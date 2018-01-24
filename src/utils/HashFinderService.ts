import {HttpClient} from '@angular/common/http';
import {calcCRC32, hex} from './crc32';
import {Injectable} from '@angular/core';

export interface HashSearchOpts {
  mode: 'full' | 'directory';
}

export type AssetPath = string;
export type AssetID = number;
export type HashMatch = [AssetID, AssetPath];

export class HashMatchResults {
  matchingHashes = new Set<number>();
  resultArray: HashMatch[] = [];

  constructor() {
  }

  get empty(): boolean {
    return this.matchingHashes.size === 0;
  }

  add(other: HashMatchResults | HashMatch) {
    if (other instanceof HashMatchResults) {
      for (const [id, path] of other.resultArray) {
        if (!this.matchingHashes.has(id)) {
          this.matchingHashes.add(id);
          this.resultArray.push([id, path]);
        }
      }
    } else {
      const [id, path] = other;
      if (!this.matchingHashes.has(id)) {
        this.matchingHashes.add(id);
        this.resultArray.push([id, path]);
      }
    }
  }
}

@Injectable()
export class HashFinderService {
  knownHashes = new Map<AssetID, AssetPath>();
  knownPaths = new Set<string>();
  knownFolders = new Set<string>();
  private opts: HashSearchOpts;

  constructor(http: HttpClient) {
    console.log('Loading known  hashes');
    const base = document.querySelector('base').href;
    this.loadDemoHashes(http, base);
    this.loadKnownFolders(http, base);
    this.loadPakHashes(http, base);
  }

  private loadPakHashes(http: HttpClient, base: string) {
    [
      'NoARAM.pak.txt',
      'SamGunFx.pak.txt',
      'Metroid3.pak.txt',
      'MidiData.pak.txt',
      'Metroid2.pak.txt',
      'AudioGrp.pak.txt',
      'Metroid8.pak.txt',
      'Metroid1.pak.txt',
      'GGuiSys.pak.txt',
      'Metroid4.pak.txt',
      'TestAnim.pak.txt',
      'SlideShow.pak.txt',
      'metroid5.pak.txt',
      'Tweaks.pak.txt',
      'Metroid7.pak.txt',
      'Metroid6.pak.txt',
      'SamusGun.pak.txt',
      'MiscData.pak.txt',
    ].forEach((pak) => {
      http.get(base + '/assets/' + pak, {
        responseType: 'text'
      }).toPromise()
        .then((known) => {
          const lines = known.split('\n');
          const start = performance.now();
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length === 0) {
              continue;
            }
            this.addKnownHash(Number(trimmed), pak);
          }
          const end = performance.now();
          const time = end - start;
          console.log(`Calculated ${this.knownHashes.size} known hashes in ${time}ms`);
        });
    });
  }

  private loadDemoHashes(http: HttpClient, base: string) {
    http.get(base + '/assets/known_demo_paths.txt', {
      responseType: 'text'
    }).toPromise()
      .then((known) => {
        const lines = known.split('\n');
        const start = performance.now();
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length === 0) {
            continue;
          }
          this.addKnownFile(trimmed);
        }
        const end = performance.now();
        const time = end - start;
        console.log(`Calculated ${this.knownHashes.size} known hashes`);
        console.log(`${this.knownPaths.size} known paths`);
        console.log(`${this.knownFolders.size} known folders`);
        console.log(`in ${time}ms`);
      });
  }

  private loadKnownFolders(http: HttpClient, base: string) {
    http.get(base + '/assets/known_folders.txt', {
      responseType: 'text'
    }).toPromise()
      .then((known) => {
        const lines = known.split('\n');
        const start = performance.now();
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length === 0) {
            continue;
          }
          this.addKnownFolder(trimmed);
        }
        const end = performance.now();
        const time = end - start;
        console.log(`Calculated ${this.knownFolders.size} known folders in ${time}ms`);
      });
  }

  private addKnownFile(trimmed: string) {
    this.knownPaths.add(trimmed);
    const hash = calcCRC32(trimmed);
    if (this.knownHashes.has(hash)) {
      return;
    }
    this.knownHashes.set(hash, trimmed);
    const segments = trimmed.split('/');
    for (let i = 0; i < segments.length - 1; i++) {
      this.knownFolders.add(segments.slice(0, i + 1).join('/'));
    }
  }

  private addKnownFolder(trimmed: string) {
    const segments = trimmed.split('/');
    for (let i = 0; i < segments.length; i++) {
      this.knownFolders.add(segments.slice(0, i + 1).join('/'));
    }
  }

  private addKnownHash(hash: number, pak: string) {
    if (this.knownHashes.has(hash)) {
      return;
    }
    this.knownHashes.set(hash, pak);
  }

  findHash(str: string, userOpts: Partial<HashSearchOpts>): HashMatchResults {
    this.opts = {
      mode: 'full',
      ...userOpts
    };

    const results = new HashMatchResults();

    const start = performance.now();

    results.add(this.searchDirectHash(str));
    results.add(this.searchKnownFolders(str));

    const end = performance.now();
    console.log(`Hash search time: ${end - start}ms`);

    return results;
  }

  private searchDirectHash(str: string): HashMatchResults {
    const hash = calcCRC32(str);
    const res = new HashMatchResults();
    res.add(this.validHash(hash));
    return res;
  }

  private searchKnownFolders(str: string): HashMatchResults {
    const res = new HashMatchResults();

    for (const folder of this.knownFolders) {
      const toSearch = `${folder}/${str}`;
      const hash = calcCRC32(toSearch);
      res.add(this.validHash(hash, toSearch));
    }

    return res;
  }

  private validHash(hash: number, value?: string): HashMatchResults {
    const res = new HashMatchResults();
    if (this.knownHashes.has(hash)) {
      res.add([hash, this.knownHashes.get(hash) +  ' - ' + (value || '')]);
    }
    return res;
  }
}
