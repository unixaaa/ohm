var ohm = require('../src/main.js');
ohm._ohmGrammarFactory =
(function(ohm, optNamespace) {
  var b = ohm._builder();
  b.setName('Ohm');
  b.inline('space_singleLine', b.seq(b._('//'), b.many(b.seq(b.not(b._('\n')), b.app('_')), 0), b._('\n')));
  b.inline('space_multiLine', b.seq(b._('/*'), b.many(b.seq(b.not(b._('*/')), b.app('_')), 0), b._('*/')));
  b.extend('space', b.alt(b.app('space_singleLine'), b.app('space_multiLine')));
  b.define('_name', b.seq(b.app('nameFirst'), b.many(b.app('nameRest'), 0)));
  b.define('nameFirst', b.alt(b._('_'), b.app('letter')));
  b.define('nameRest', b.alt(b._('_'), b.app('alnum')));
  b.define('name', b.seq(b.not(b.app('namedConst')), b.bind(b.app('_name'), 'n')));
  b.inline('namedConst_undefined', b.seq(b._('undefined'), b.not(b.app('nameRest'))));
  b.inline('namedConst_null', b.seq(b._('null'), b.not(b.app('nameRest'))));
  b.inline('namedConst_true', b.seq(b._('true'), b.not(b.app('nameRest'))));
  b.inline('namedConst_false', b.seq(b._('false'), b.not(b.app('nameRest'))));
  b.define('namedConst', b.alt(b.app('namedConst_undefined'), b.app('namedConst_null'), b.app('namedConst_true'), b.app('namedConst_false')));
  b.define('string', b.seq(b._("'"), b.bind(b.many(b.app('sChar'), 0), 'cs'), b._("'")));
  b.define('sChar', b.alt(b.seq(b._('\\x'), b.app('hexDigit'), b.app('hexDigit')), b.seq(b._('\\u'), b.app('hexDigit'), b.app('hexDigit'), b.app('hexDigit'), b.app('hexDigit')), b.seq(b._('\\'), b.app('_')), b.seq(b.not(b._("'")), b.app('_'))));
  b.define('regexp', b.seq(b._('/'), b.bind(b.app('reCharClass'), 'e'), b._('/')));
  b.define('reCharClass', b.seq(b._('['), b.many(b.alt(b._('\\]'), b.seq(b.not(b._(']')), b.app('_'))), 0), b._(']')));
  b.define('number', b.seq(b.opt(b._('-')), b.many(b.app('digit'), 1)));
  b.inline('Alt_rec', b.seq(b.bind(b.app('Term'), 'x'), b._('|'), b.bind(b.app('Alt'), 'y')));
  b.define('Alt', b.alt(b.app('Alt_rec'), b.app('Term')));
  b.inline('Term_inline', b.seq(b.bind(b.app('Seq'), 'x'), b._('{'), b.bind(b.app('_name'), 'n'), b._('}')));
  b.define('Term', b.alt(b.app('Term_inline'), b.app('Seq')));
  b.define('Seq', b.many(b.app('Factor'), 0));
  b.inline('Factor_bind', b.seq(b.bind(b.app('Iter'), 'x'), b._('.'), b.bind(b.app('name'), 'n')));
  b.define('Factor', b.alt(b.app('Factor_bind'), b.app('Iter')));
  b.inline('Iter_star', b.seq(b.bind(b.app('Pred'), 'x'), b._('*')));
  b.inline('Iter_plus', b.seq(b.bind(b.app('Pred'), 'x'), b._('+')));
  b.inline('Iter_opt', b.seq(b.bind(b.app('Pred'), 'x'), b._('?')));
  b.define('Iter', b.alt(b.app('Iter_star'), b.app('Iter_plus'), b.app('Iter_opt'), b.app('Pred')));
  b.inline('Pred_not', b.seq(b._('~'), b.bind(b.app('Base'), 'x')));
  b.inline('Pred_lookahead', b.seq(b._('&'), b.bind(b.app('Base'), 'x')));
  b.define('Pred', b.alt(b.app('Pred_not'), b.app('Pred_lookahead'), b.app('Base')));
  b.inline('Base_application', b.seq(b.bind(b.app('name'), 'ruleName'), b.not(b.alt(b._('=='), b._(':='), b._('+=')))));
  b.inline('Base_prim', b.alt(b.app('namedConst'), b.app('string'), b.app('regexp'), b.app('number')));
  b.inline('Base_lst', b.seq(b._('['), b.bind(b.app('Alt'), 'x'), b._(']')));
  b.inline('Base_str', b.seq(b._('"'), b.bind(b.app('Alt'), 'x'), b._('"')));
  b.inline('Base_paren', b.seq(b._('('), b.bind(b.app('Alt'), 'x'), b._(')')));
  b.inline('Base_obj', b.seq(b._('{'), b.bind(b.opt(b._('...')), 'lenient'), b._('}')));
  b.inline('Base_objWithProps', b.seq(b._('{'), b.bind(b.app('Props'), 'ps'), b.bind(b.opt(b.seq(b._(','), b._('...'))), 'lenient'), b._('}')));
  b.define('Base', b.alt(b.app('Base_application'), b.app('Base_prim'), b.app('Base_lst'), b.app('Base_str'), b.app('Base_paren'), b.app('Base_obj'), b.app('Base_objWithProps')));
  b.inline('Props_rec', b.seq(b.bind(b.app('Prop'), 'p'), b._(','), b.bind(b.app('Props'), 'ps')));
  b.inline('Props_base', b.bind(b.app('Prop'), 'p'));
  b.define('Props', b.alt(b.app('Props_rec'), b.app('Props_base')));
  b.define('Prop', b.seq(b.bind(b.alt(b.app('_name'), b.app('string')), 'n'), b._(':'), b.bind(b.app('Factor'), 'p')));
  b.inline('Rule_define', b.seq(b.bind(b.app('name'), 'n'), b._('=='), b.bind(b.app('Alt'), 'b')));
  b.inline('Rule_override', b.seq(b.bind(b.app('name'), 'n'), b._(':='), b.bind(b.app('Alt'), 'b')));
  b.inline('Rule_extend', b.seq(b.bind(b.app('name'), 'n'), b._('+='), b.bind(b.app('Alt'), 'b')));
  b.define('Rule', b.alt(b.app('Rule_define'), b.app('Rule_override'), b.app('Rule_extend')));
  b.inline('SuperGrammar_qualified', b.seq(b._('<:'), b.bind(b.app('name'), 'ns'), b._('.'), b.bind(b.app('name'), 'n')));
  b.inline('SuperGrammar_unqualified', b.seq(b._('<:'), b.bind(b.app('name'), 'n')));
  b.define('SuperGrammar', b.alt(b.app('SuperGrammar_qualified'), b.app('SuperGrammar_unqualified')));
  b.define('Grammar', b.seq(b.bind(b.app('name'), 'n'), b.bind(b.opt(b.app('SuperGrammar')), 's'), b._('{'), b.bind(b.many(b.app('Rule'), 0), 'rs'), b._('}')));
  b.define('Grammars', b.many(b.app('Grammar'), 0));
  return b.build(optNamespace);
});
