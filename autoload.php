<?php

declare(strict_types=1);

/** Register the codeformat namespace directly in the Composer autoloader, to avoid needing to add a dev dependency. */
$loaders = \Composer\Autoload\ClassLoader::getRegisteredLoaders();
$loader = \reset($loaders);
if ($loader === false) {
  throw new \RuntimeException('Could not find a registered Composer autoloader.');
}

$loader->addPsr4('Averay\\Codeformat\\', __DIR__ . '/dist/src/php/');
