// تفسير ابن كثير - الفهرس الرئيسي
import { TafsirData } from '../../index';

// Import surahs
import surah1 from './surah-001';
import surah2 from './surah-002';
import surah3 from './surah-003';
import surah18 from './surah-018';
import surah36 from './surah-036';
import surah55 from './surah-055';
import surah56 from './surah-056';
import surah67 from './surah-067';
import surah78 from './surah-078';
import surah112 from './surah-112';
import surah113 from './surah-113';
import surah114 from './surah-114';
import juzAmma from './juz-amma';

const ibnKathirData: TafsirData = {
  ...surah1,
  ...surah2,
  ...surah3,
  ...surah18,
  ...surah36,
  ...surah55,
  ...surah56,
  ...surah67,
  ...surah78,
  ...juzAmma,
  ...surah112,
  ...surah113,
  ...surah114,
};

export default ibnKathirData;
