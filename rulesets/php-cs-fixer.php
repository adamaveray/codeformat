<?php

declare(strict_types=1);

// Issues Mago does not autofix
$fixesForMago = [
  'backtick_to_shell_exec' => true,
  'class_reference_name_casing' => true,
  'empty_loop_condition' => true,
  'explicit_indirect_variable' => true,
  'lambda_not_used_import' => true,
  'native_function_casing' => true,
  'native_function_invocation' => ['include' => ['@internal']],
  'no_alternative_syntax' => true,
  'no_superfluous_elseif' => true,
  'no_unneeded_braces' => ['namespaces' => true],
  'php_unit_method_casing' => true,
];

$docblocks = [
  'general_phpdoc_tag_rename' => ['replacements' => ['inheritDocs' => 'inheritDoc']],
  'multiline_comment_opening_closing' => true,
  'no_blank_lines_after_phpdoc' => true,
  'no_superfluous_phpdoc_tags' => ['allow_mixed' => true],
  'phpdoc_add_missing_param_annotation' => true,
  'phpdoc_inline_tag_normalizer' => true,
  'phpdoc_no_access' => true,
  'phpdoc_no_alias_tag' => [
    'replacements' => [
      'const' => 'var',
      'link' => 'see',
      'property-read' => 'property',
      'property-write' => 'property',
      'type' => 'var',
    ],
  ],
  'phpdoc_no_duplicate_types' => true,
  'phpdoc_no_empty_return' => true,
  'phpdoc_no_package' => true,
  'phpdoc_no_useless_inheritdoc' => true,
  'phpdoc_order' => ['order' => ['param', 'return', 'throws']],
  'phpdoc_order_by_value' => true,
  'phpdoc_return_self_reference' => true,
  'phpdoc_scalar' => [
    'types' => [
      'boolean',
      'callback',
      'double',
      'integer',
      'never-return',
      'never-returns',
      'no-return',
      'real',
      'str',
    ],
  ],
  'phpdoc_separation' => [
    'groups' => [
      ['Annotation', 'NamedArgumentConstructor', 'Target'],
      ['author', 'copyright', 'license'],
      ['category', 'package', 'subpackage'],
      ['property', 'property-read', 'property-write'],
      ['deprecated', 'link', 'see', 'since'],
    ],
  ],
  'phpdoc_single_line_var_spacing' => true,
  'phpdoc_summary' => true,
  'phpdoc_tag_casing' => true,
  'phpdoc_tag_type' => ['tags' => ['inheritDoc' => 'inline']],
  'phpdoc_to_comment' => ['ignored_tags' => ['lang', 'noinspection', 'psalm-suppress', 'psalm-type', 'var']],
  'phpdoc_trim' => true,
  'phpdoc_trim_consecutive_blank_line_separation' => true,
  'phpdoc_types' => true,
  'phpdoc_types_order' => ['null_adjustment' => 'always_last', 'sort_algorithm' => 'none'],
  'phpdoc_var_annotation_correct_order' => true,
  'phpdoc_var_without_name' => true,
  'single_line_comment_spacing' => true,
];

$syntax = [
  'elseif' => true,
  'fully_qualified_strict_types' => ['leading_backslash_in_global_namespace' => true],
  'global_namespace_import' => ['import_classes' => false, 'import_constants' => false, 'import_functions' => false],
  'heredoc_to_nowdoc' => true,
  'increment_style' => ['style' => 'post'],
  'integer_literal_case' => true,
  'magic_method_casing' => true,
  'modifier_keywords' => true,
  'no_alias_language_construct_call' => true,
  'no_break_comment' => true,
  'no_empty_statement' => true,
  'no_mixed_echo_print' => true,
  'no_useless_nullsafe_operator' => true,
  'no_useless_return' => true,
  'self_static_accessor' => true,
  'single_class_element_per_statement' => true,
  'standardize_increment' => true,
  'standardize_not_equals' => true,
  'string_implicit_backslashes' => ['single_quoted' => 'escape', 'double_quoted' => 'escape', 'heredoc' => 'escape'],
  'switch_continue_to_break' => true,
];

$phpUnit = [
  'php_unit_internal_class' => true,
  'php_unit_test_class_requires_covers' => true,
];

return $fixesForMago + $docblocks + $syntax + $phpUnit;
