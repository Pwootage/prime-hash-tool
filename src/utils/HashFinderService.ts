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
    console.log('Loading known demo hashes');
    http.get('/assets/known_demo_paths.txt', {
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
          this.addKnownPath(trimmed);
        }
        const end = performance.now();
        const time = end - start;
        console.log(`Calculated ${this.knownHashes.size} known hashes`);
        console.log(`${this.knownPaths.size} known paths`);
        console.log(`${this.knownFolders.size} known folders`);
        console.log(`in ${time}ms`);
      });
  }

  private addKnownPath(trimmed: string) {
    this.knownPaths.add(trimmed);
    const hash = calcCRC32(trimmed);
    this.knownHashes.set(hash, trimmed);
    const segments = trimmed.split('/');
    for (let i = 0; i < segments.length - 1; i++) {
      this.knownFolders.add(segments.slice(0, i + 1).join('/'));
    }
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
      const hash = calcCRC32(`${folder}/${str}`);
      res.add(this.validHash(hash));
    }

    return res;
  }

  private validHash(hash: number): HashMatchResults {
    const res = new HashMatchResults();
    if (this.knownHashes.has(hash)) {
      res.add([hash, this.knownHashes.get(hash)]);
    }
    return res;
  }
}
