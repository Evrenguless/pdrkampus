# -*- coding: utf-8 -*-
import copy,json,unittest
from pathlib import Path
from build_analysis_pilot import validate, render, audit
from seo_engine import protected, safe_output
ROOT=Path(__file__).resolve().parents[1]
class PilotTests(unittest.TestCase):
 def setUp(self):self.m=json.loads((ROOT/'seo/analysis-pilot.json').read_text())
 def test_six_distinct_intents(self):self.assertEqual(len(validate(self.m)),6)
 def test_structure_and_noindex(self):
  for p in self.m['pages']:self.assertTrue(audit(p,self.m)['eligible_for_review'])
 def test_existing_application_protected(self):self.assertTrue(protected(ROOT)['pass'])
 def test_no_personal_verification_in_visible_pages(self):
  for p in self.m['pages']:
   s=render(p,self.m)
   for phrase in ['veri sahibi','kullanıcı teyidi','Supabase','pdrkampus_site_datasets','henüz','doğrulanmamış']:self.assertNotIn(phrase,s)
 def test_no_calculator_or_runtime_added(self):
  for p in self.m['pages']:
   s=render(p,self.m);self.assertNotIn('<form',s);self.assertNotIn('<input',s);self.assertEqual(s.count('<script'),1);self.assertIn('application/ld+json',s)
 def test_duplicate_blocked(self):
  self.m['pages'][1]['route']=self.m['pages'][0]['route']
  with self.assertRaises(ValueError):validate(self.m)
 def test_individual_fields_blocked(self):
  self.m['pages'][0]['candidate_reference_dataset']=[]
  with self.assertRaises(ValueError):validate(self.m)
 def test_output_inside_application_blocked(self):
  with self.assertRaises(ValueError):safe_output(ROOT,ROOT/'pilot')
 def test_publish_mode_blocked(self):
  self.m['publication']='live'
  with self.assertRaises(ValueError):validate(self.m)
 def test_historical_values_preserved(self):
  p=next(p for p in self.m['pages'] if 'atama-kontenjanlari' in p['route']);rows=p['sections'][0]['table']['rows'];self.assertEqual(len(rows),11);self.assertEqual(rows[-1],[2026,603,6.03,23212,10000])
 def test_topics_total_and_year(self):
  p=next(p for p in self.m['pages'] if 'konu-dagilimi' in p['route']);self.assertEqual(sum(r[1] for r in p['sections'][0]['table']['rows']),50);self.assertIn('2026',p['title'])
if __name__=='__main__':unittest.main()
