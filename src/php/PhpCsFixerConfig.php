<?php

declare(strict_types=1);

namespace Averay\Codeformat;

use PhpCsFixer\Config as BaseConfig;
use PhpCsFixer\Finder;
use PhpCsFixer\Runner\Parallel\ParallelConfigFactory;

/**
 * @api
 *
 * @psalm-consistent-constructor
 */
class PhpCsFixerConfig extends BaseConfig
{
  public static function default(?Finder $finder = null): static
  {
    $config = new static();

    $config->setParallelConfig(ParallelConfigFactory::detect())->setRiskyAllowed(true)->setRules(static::loadRules());

    if ($finder !== null) {
      $config->setFinder($finder);
    }

    return $config;
  }

  /**
   * @return array<string, array<string, mixed>|bool>
   */
  protected static function loadRules(): array
  {
    /** @var array<string, array<string, mixed>|bool> $rules */
    $rules = require __DIR__ . '/../../rulesets/php-cs-fixer.php';

    return $rules;
  }
}
