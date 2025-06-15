<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/src/php/PhpCsFixerConfig.php';

$finder = (new PhpCsFixer\Finder())->in([__DIR__])->exclude(['var']);

return PhpCsFixerConfig::default($finder);
