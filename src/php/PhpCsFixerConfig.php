<?php
declare(strict_types=1);

use PhpCsFixer\Config as BaseConfig;
use PhpCsFixer\Finder;
use PhpCsFixer\Runner\Parallel\ParallelConfigFactory;

class PhpCsFixerConfig extends BaseConfig
{
  protected static function loadRules(): array
  {
    return require __DIR__ . '/../../rulesets/php/ruleset-php-cs-fixer.php';
  }

  public static function default(?Finder $finder = null): self
  {
    $config = new self();

    $config->setParallelConfig(ParallelConfigFactory::detect())->setRiskyAllowed(true)->setRules(static::loadRules());
    $config->setUnsupportedPhpVersionAllowed(self::phpVersionCompare('>=', '8.5.0'));

    if ($finder !== null) {
      $config->setFinder($finder);
    }

    return $config;
  }

  private static function phpVersionCompare(string $operator, string $version): bool
  {
    return \version_compare(
      \PHP_MAJOR_VERSION . '.' . \PHP_MINOR_VERSION . '.' . \PHP_RELEASE_VERSION,
      $version,
      $operator,
    );
  }
}
