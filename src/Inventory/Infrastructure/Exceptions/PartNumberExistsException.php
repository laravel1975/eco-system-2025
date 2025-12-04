<?php

namespace TmrEcosystem\Inventory\Application\Exceptions;

// เป็นคลาสเปล่าๆ ที่ extends \Exception (หรือ \RuntimeException)
// เพื่อให้เรา "แยกแยะ" ประเภทของ Error ได้
class PartNumberExistsException extends \Exception
{
}
