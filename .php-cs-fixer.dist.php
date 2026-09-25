<?php

declare(strict_types=1);

$finder = new PhpCsFixer\Finder()->in([__DIR__])->exclude(['dist', 'node_modules', 'vendor']);

return Averay\Codeformat\PhpCsFixerConfig::default($finder);
